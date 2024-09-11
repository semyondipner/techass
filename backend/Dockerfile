FROM python:3.10 

WORKDIR /app

COPY requirements.txt /app

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

EXPOSE 8080

# COPY ./ /app

CMD ["python", "api.py"]