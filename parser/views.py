import traceback
import json
import traceback
import csv
import os
import re
import io
import pdfplumber

#from google.colab.patches import cv2_imshow
from datetime import datetime, date
from datetime import date, datetime
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth import views, login, authenticate,logout
from django.urls import reverse
from django.shortcuts import render, get_object_or_404
from django.views import generic

from django.utils import timezone
from django.http import HttpResponse,JsonResponse, Http404, HttpResponseRedirect
from django.contrib.auth.decorators import login_required

from django.core.serializers.json import DjangoJSONEncoder
from django.forms import Media


file = None  
points = []
    
def home(request):
    if request.method == 'POST':
        pass
    else:
        template = loader.get_template('home.html')
        return HttpResponse(template.render({},request))
        
    
def file_upload_parser(request): 
    
    file  = request.FILES["pdf_file"]
    fileName = request.FILES["pdf_file"].name
    parse_file(file, fileName)
    file = open("reports/report.csv","r")
    reader = csv.reader(file)
    print(type(reader))
    rows = []
    for row in reader:
        rows.append(row)
    jsondata = {"status_message":"Success", "reader":rows}
    
   
    return JsonResponse(jsondata)
 
def parse_file( file, fileName):
    file_name = os.path.splitext(os.path.basename(fileName))[0]
    status_message = ""
    details = []
    files=[]

    pdf = pdfplumber.open(file)
    with open("reports/report.csv","w") as file:
        writer=csv.writer(file)
        for i,page in enumerate(pdf.pages):
            if "Schedule 100"in page.extract_text() or\
                "INCOME STATEMENT INFORMATION" in page.extract_text():
                files.append(i)
                
                page=page.crop((20,50,600,600))
                table_settings = {
                    "vertical_strategy": "text",
                    "horizontal_strategy": "text",
                    "snap_y_tolerance": 5,
                    "snap_x_tolerance":10,
                    "keep_blank_chars":True,
                    "text_x_tolerance":4,
                    "intersection_x_tolerance":5,
                    "join_x_tolerance":5,
                }
                tables = page.extract_tables(table_settings)
                for table in tables:
                  for row in table:
                      if "Schedule 100" in pdf.pages[i].extract_text():
                        if 'Assets' in row:
                            writer.writerow(['Assets'])
                        elif 'Liabilities' in row:
                            writer.writerow(['Liabilities'])
                        elif 'Equity' in row:
                              writer.writerow(['Equity'])
                        elif "Retained earnings" in row:
                            break
                        else:
                            writer.writerow(row) 
                      if "INCOME STATEMENT INFORMATION" in pdf.pages[i].extract_text():
                        if 'Revenue' in row:
                            writer.writerow(['Revenue'])
                        elif 'Cost of sales' in row:
                            writer.writerow(['Cost of sales'])
                        elif 'Operating expenses' in row:
                              writer.writerow(['Operating expenses'])
                        elif 'Farming revenue' in row:
                              writer.writerow(['Farming revenue'])
                        elif 'Farming expenses' in row:
                              writer.writerow(['Farming expenses'])
                        elif "Other comprehensive income" in row:
                            break
                        else:
                            writer.writerow(row)  
                      #print(row)
                      #print('------------------------------------------------')
                  print("*******************************************")
        
        
def extract_export(request):        
    response = HttpResponse(
                        content_type='text/csv',
                        headers={'Content-Disposition': 'attachment; filename="report.csv"'},
                    )
    writer = csv.writer(response)
    file = open("reports/report.csv","r")
    reader = csv.reader(file)
    for row in reader:
        
        non_blank = [col for col in row if col.strip()!=""]
        if non_blank:
            print(row)
            writer.writerow(row)
    return response 