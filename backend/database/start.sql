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