from authorization.models import User
from django.db.models import query
from django.http import request
from rest_framework import generics

from accident.models import Accident, AccidentHistory
from accident.permissions import IsOwnerOrReadOnly
from accident.serializers import AccidentHistorySerializer, AccidentSerializer


# class UserList(generics.ListAPIView):
#     '''GET - возвращает всех пользователей, с созданными ими инцидентами'''
#     queryset = User.objects.all()
#     serializer_class = UserSerializer


# class UserDetail(generics.RetrieveAPIView):
#     '''GET+pk - возвращает user(id=pk)'''
#     queryset = User.objects.all()
#     serializer_class = UserSerializer


class AccidentList(generics.ListCreateAPIView):
    '''GET - выводит все инциденты. POST - создает инцидент'''
    queryset = Accident.objects.all()
    serializer_class = AccidentSerializer

    sort_params = {
        'sort': None,
        'perPage': None,
        'dateStart': None,
        'dateEnd': None,
        'accClass': None,
    }

    def get_filter_params(self) -> 'tuple[dict, str]':
        """Очищает словарь от непереданных фильтров, парсит фильтры. 
        Возвращает словарь аргументов для фильтрации и порядок сортировки"""
        # Чистим лишние элементы словаря (параметры, которые не были переданы)
        tmp = self.sort_params.copy()
        [tmp.pop(param) for param in self.sort_params if self.sort_params[param] is None]
        # Если не передан параметр order или равен любой строке, кроме DESC - '', иначе '-'
        ordering = '' if tmp.pop('order', 'ASC') == 'DESC' else '-'

        acc_class_filter = tmp.get('accClass')
        acc_class_filter = None if acc_class_filter == 'null' else tuple(map(int, acc_class_filter.split(';')))
        d = {
            'time_appeared__date__range': (tmp.get('dateStart'), tmp.get('dateEnd')),
        }
        # Если класс инцидента null - будем искать инциденты только с классом None, иначе ищем в переданной последовательности
        if acc_class_filter is None:
            d['accident_class__number'] = acc_class_filter
        else: 
            d['accident_class__number__in'] = acc_class_filter
        return d, ordering

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params
        for key in self.sort_params:
            self.sort_params[key] = params.get(key)
        
        filter_params, ordering = self.get_filter_params()
        queryset = self.queryset.filter(**filter_params).order_by(f'{ordering}time_appeared')
        return queryset

    def perform_create(self, serializer):
        '''пробрасывает user из request в serializer'''
        serializer.save(user=self.request.user)


class AccidentHistoryList(generics.ListCreateAPIView):
    '''GET - выводит все истории изменений. POST - создает историю изменения к определенному инциденту'''
    queryset = AccidentHistory.objects.all()
    serializer_class = AccidentHistorySerializer

    def perform_create(self, serializer):
        '''
        Сценарий создания истории (редактирования инцидента):
        1. клиент заполняет форму опредленного инцидента с полями (класс инцидента, описание)
        2. с фронта приходит джсон {accident_id, accident_class, description}
        3. необходимо положить класс и описание в инцидент по айди и историю уже сохранить с описанием, классом инцидента по айди
        '''
        accident = Accident.objects.get(id=serializer.validated_data['accident_id'])
        current_description, current_class = accident.description, accident.accident_class
        accident.description = serializer.validated_data.get('description')
        accident.accident_class = serializer.validated_data.get('accident_class')
        accident.save()
        acc_history_elem = AccidentHistory(accident=accident, accident_class=current_class,
                                           description=current_description)
        acc_history_elem.save()


class AccidentDetail(generics.RetrieveDestroyAPIView):
    '''GET+pk - возвращает Accident(id=pk)'''
    permission_classes = [IsOwnerOrReadOnly, ]
    queryset = Accident.objects.all()
    serializer_class = AccidentSerializer

    # def perform_destroy(self, serializer: Accident):
    #     print(serializer.history)

