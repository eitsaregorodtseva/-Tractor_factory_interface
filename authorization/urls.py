from django.urls import path
from .views import RegistrationAPIView, LoginAPIView, UserRetrieveUpdateAPIView, UserUpdateGroupAPIView, \
    UsersRetrieveAPIView, UserDeleteAPIView

app_name = 'authentication'
urlpatterns = [
    path('user', UserRetrieveUpdateAPIView.as_view()),
    path('users/', RegistrationAPIView.as_view()),
    path('users/login/', LoginAPIView.as_view()),
    path('user/group/', UserUpdateGroupAPIView.as_view()),
    path('user/delete/', UserDeleteAPIView.as_view()),
    path('users/all/', UsersRetrieveAPIView.as_view())
]
