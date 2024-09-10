
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

Запуск сервиса локально


Swagger доступен по адресу:
http://localhost:8000/docs