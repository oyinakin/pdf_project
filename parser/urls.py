from django.urls import path, include
from . import views
from django.contrib.auth import views as auth_views
from django.conf import settings

from django.views.static import serve

urlpatterns = [
    path('', views.home, name ='home'),	
    	
    path('file_upload_parser', views.file_upload_parser, name ='file_upload_parser'),
    path('extract_export', views.extract_export, name ='extract_export'),
]