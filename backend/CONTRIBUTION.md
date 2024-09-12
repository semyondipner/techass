
Перейдите в папку backend

Создайте виртуальное окружение командой
```commandline
python -m venv .venv
```

Активируйте виртуальное окружение
Windows
```commandline
.\\.venv\\Scripts\\activate

```
MacOS/Linux
```commandline
source .venv/bin/activate
```

Установите зависимости 
```
pip install -r requirements.txt
```

Если вы добавляете новую зависимость в проект, нужно добавить ее в requirements.txt

```commandline
pip freeze > Ваш_путь\requirements.txt
```

смотрите версию зависимости, которую установили и добавляете в requirements.txt, рекурентные зависимости добавлять не нужно

Запуск сервиса локально

В папке backend выполните команду
```
python api.py
```
Сервис будет доступен по адресу: 
http://0.0.0.0:8080/

Swagger доступен по адресу:
http://0.0.0.0:8080/docs

### Сборка докер образа

В папке backend выполните команду
```
docker build -t backend .
```
После сборки образа выполните команду: 

```commandline
docker run -p 8080:8080 backend 
```


