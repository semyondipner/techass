FROM python:3.11

WORKDIR /app

COPY ./ /app

RUN pip install --upgrade pip && pip install -r /app/requirements.txt

EXPOSE 9080

CMD ["python", "api.py"]