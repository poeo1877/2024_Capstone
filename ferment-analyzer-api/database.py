from databases import Database
import pandas as pd
from sqlalchemy import Table, Column, Integer, MetaData, Numeric, BigInteger, TIMESTAMP, String, ForeignKey, Enum

# DATABASE_URL = "postgresql://postgres:kilo7816@localhost/COREDB"
DATABASE_URL = "postgresql://postgres:kilo7816@localhost:5432/COREDB"
database = Database(DATABASE_URL)

metadata = MetaData()

async def connect_to_db():
    await database.connect()

async def disconnect_from_db():
    await database.disconnect()


sensor_measurement = Table(
    "sensor_measurement",
    metadata,
    Column("data_id", BigInteger, primary_key=True),
    Column("co2_concentration", Integer),
    Column("brix", Numeric(5, 3)),
    Column("measured_time", TIMESTAMP),
    Column("out_temperature", Numeric(5, 3)),
    Column("in_temperature", Numeric(5, 3)),
    Column("ph", Numeric(4, 2)),
    Column("pressure_upper", Numeric(10, 4)),
    Column("pressure_lower", Numeric(10, 4)),
    Column("batch_id", Integer, ForeignKey("batch.batch_id")),
    Column("relative_time", Integer),
)


# # 이 파일에서 결측치랑 데이터 전처리를 한다. 우선 임시로 이렇게
async def get_batch_data(batch_id: int):
    query = sensor_measurement.select().where(
        sensor_measurement.c.batch_id == batch_id,
        sensor_measurement.c.measured_time.isnot(None)
    ).order_by(sensor_measurement.c.data_id.asc())
    batch_data = await database.fetch_all(query)
    df = pd.DataFrame([dict(row) for row in batch_data])
    df['measured_time'] = pd.to_datetime(df['measured_time'])
    df.set_index('measured_time', inplace=True)
    return df

# async def get_batch_data(batch_ids: list):
#     query = sensor_measurement.select().where(
#         sensor_measurement.c.batch_id.in_(batch_ids),
#         sensor_measurement.c.measured_time.isnot(None)
#     ).order_by(sensor_measurement.c.data_id.asc())
#     batch_data = await database.fetch_all(query)
#     df = pd.DataFrame([dict(row) for row in batch_data])
#     df['measured_time'] = pd.to_datetime(df['measured_time'])
#     df.set_index('measured_time', inplace=True)
#     return df
