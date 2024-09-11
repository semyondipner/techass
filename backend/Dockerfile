FROM python:3.10 

WORKDIR /app

COPY ./ /app

RUN pip install --upgrade pip && pip install -r /app/requirements.txt

EXPOSE 8080

CMD ["python", "api.py"]