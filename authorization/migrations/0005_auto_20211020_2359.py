# Generated by Django 3.2.8 on 2021-10-20 23:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authorization', '0004_auto_20211020_2215'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Accident',
        ),
        migrations.DeleteModel(
            name='AccidentClass',
        ),
    ]
