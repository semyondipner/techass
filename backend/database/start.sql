CREATE TABLE price (
	item_id VARCHAR NOT NULL,
	store_id VARCHAR NOT NULL,
	wm_yr_wk INTEGER NOT NULL,
	sell_price FLOAT NOT NULL,
	PRIMARY KEY (item_id, store_id, wm_yr_wk)
)

CREATE TABLE sale (
	item_id VARCHAR NOT NULL,
	store_id VARCHAR NOT NULL,
	date_id INTEGER NOT NULL,
	cnt INTEGER NOT NULL,
	PRIMARY KEY (item_id, store_id, date_id)
)

CREATE TABLE salesdate (
	date TEXT,
	wm_yr_wk BIGINT,
	weekday TEXT,
	wday BIGINT,
	month BIGINT,
	year BIGINT,
	event_name_1 TEXT,
	event_type_1 TEXT,
	event_name_2 TEXT,
	event_type_2 TEXT,
	date_id BIGINT,
	"CASHBACK_STORE_1" BIGINT,
	"CASHBACK_STORE_2" BIGINT,
	"CASHBACK_STORE_3" BIGINT
)

CREATE TABLE prediction (
	item_id VARCHAR NOT NULL,
	store_id VARCHAR NOT NULL,
	date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	low FLOAT NOT NULL,
	median FLOAT NOT NULL,
	high FLOAT NOT NULL,
	prediction_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (item_id, store_id, date)
)

CREATE TABLE clustering (
	id SERIAL NOT NULL,
	item_id VARCHAR NOT NULL,
	store_id VARCHAR NOT NULL,
	date_id INTEGER NOT NULL,
	cnt INTEGER NOT NULL,
	date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	year INTEGER NOT NULL,
	wm_yr_wk INTEGER NOT NULL,
	store_item_id VARCHAR NOT NULL,
	cluster INTEGER NOT NULL,
	PRIMARY KEY (id)
)

CREATE TABLE decomposition (
	id SERIAL NOT NULL,
	item_id VARCHAR NOT NULL,
	store_id VARCHAR NOT NULL,
	date_id INTEGER NOT NULL,
	date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	cnt INTEGER NOT NULL,
	year INTEGER NOT NULL,
	wm_yr_wk INTEGER NOT NULL,
	store_item_id VARCHAR NOT NULL,
	trend FLOAT NOT NULL,
	seasonality FLOAT NOT NULL,
	PRIMARY KEY (id)
)
