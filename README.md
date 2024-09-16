# Techass (Technologies as a service)

## AI Product Hack (AI Talented Hub 2024-2026)

Кейс 06 - Прогнозирование спроса для Ритейлеров

Задача - Необходимо разработать инструмент прогнозирования спроса для ритейл-компаний, предназначенный для использования аналитиками и менеджерами. Инструмент должен включать в себя функции кластеризации, декомпозиции, обработки данных, создания моделей для новинок, и 
интеграцией в веб-интерфейс

**Frontend:** http://84.201.147.115:443

**Backend (API):** http://84.201.147.115:8080/docs#/

## Диаграмма взаимодействия

![photo_2024-09-06 22 01 51](https://github.com/user-attachments/assets/45a27082-c7db-4a16-8074-dc59b22d8f27)

## Архитектурная схема

<img width="894" alt="Снимок экрана 2024-09-09 в 21 19 56" src="https://github.com/user-attachments/assets/f1b6b3d1-a0eb-4ad9-a3d3-047a6351f4b7">

# Разворачивание решения
## ( VM1 ) DataBase - PostgreSQL

Создаем VM на Ubuntu 22.04 и разворачиваем на ней базу данных. В нашем случае мы ее развернули в docker контейнере для простоты. Желательно развернуть локально.

```bash
ssh <your name>@<your vm1 host>
docker pull posgtres
docker run -p 5432:5432 \
	--name techassdb \
	-e POSTGRES_USER=techass \
	-e POSTGRES_PASSWORD=techass987 \
	-e POSTGRES_DB=techass \
	-d postgres
```

## ( VM2 ) Service - Sales Forecast

**Примерный план:**
1. Подключаемся к серверу, на котором будет разворачиваться решение.
2. Cоздаем пару ключей для клонирования репозитория.
3. Добавляем ключ в "Deployment keys" в настройках репозитория Github

```bash
ssh <your name>@<your vm2 host>
ssh-keygen -b 4096
cd .ssh/
cat <filename>.pub
```

Клонируем к себе на машину репозиторий.

```bash
git clone git@github.com:semyondipner/techass.git
```

### Frontend

Создаем и запускаем docker образ

```bash
cd ~/techass/frontend
docker build -t frontend .
docker run -d -p 443:443 frontend
```

### Backend 

Создаем и запускаем docker образ

```bash
cd ~/techass/backend
docker build -t backend .
docker run -d -p 8080:8080 backend
```

### Prediction

Создаем и запускаем docker образ

```bash
cd ~/techass/prediction
docker build -t prediction .
docker run -d -p 9080:9080 prediction
```
