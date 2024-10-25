from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from databases import Database
from sqlalchemy import Table, Column, Integer, MetaData, Numeric, BigInteger, TIMESTAMP, String, ForeignKey, Enum
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose
import enum
from pydantic import BaseModel


# 개발환경에서 필요한 패키지 설치
import matplotlib.pyplot as plt

# kilo7816 자리에 자신의 DB 비밀번호 입력
DATABASE_URL = "postgresql://postgres:kilo7816@localhost/COREDB"

database = Database(DATABASE_URL)
metadata = MetaData()

# Define enums
class FermentationStatus(enum.Enum):
    WAITING = "WAITING"
    FERMENTING = "FERMENTING"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

# Define tables
fermenter = Table(
    "fermenter",
    metadata,
    Column("fermenter_id", Integer, primary_key=True),
    Column("fermenter_volume", Integer, nullable=False),
    Column("status", Enum(FermentationStatus), default=FermentationStatus.WAITING, nullable=False),
    Column("fermenter_line", String(100)),
)

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

batch = Table(
    "batch",
    metadata,
    Column("batch_id", Integer, primary_key=True),
    Column("start_time", TIMESTAMP, default="now()", nullable=False),
    Column("end_time", TIMESTAMP),
    Column("recipe_ratio", String(10), default="1.0"),
    Column("recipe_id", Integer, ForeignKey("recipe.recipe_id")),
    Column("fermenter_id", Integer, ForeignKey("fermenter.fermenter_id")),
)

recipe = Table(
    "recipe",
    metadata,
    Column("recipe_id", Integer, primary_key=True),
    Column("created_at", TIMESTAMP, default="CURRENT_TIMESTAMP"),
    Column("updated_at", TIMESTAMP),
    Column("recipe_detail", String),
    Column("recipe_name", String(100), nullable=False),
    Column("product_name", String(100), nullable=False),
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow all origins. 나중에 보안을 위해 수정 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()



# Define a request model
class BatchRequest(BaseModel):
    batch_id: int

@app.post("/analyze")
async def analyze_batch(request: BatchRequest):
    batch_id = request.batch_id

    query = sensor_measurement.select().where(
        sensor_measurement.c.batch_id == batch_id,
        sensor_measurement.c.measured_time.isnot(None)
    ).order_by(sensor_measurement.c.data_id.asc())
    batch_data = await database.fetch_all(query)

    # Convert to DataFrame
    df = pd.DataFrame([dict(row) for row in batch_data])
    
    if df.empty:
        raise HTTPException(status_code=404, detail="No data found for the given batch_id")

    # Check if 'measured_time' is in DataFrame columns
    if 'measured_time' not in df.columns:
        raise HTTPException(status_code=400, detail="'measured_time' column not found in fetched data")

    df['measured_time'] = pd.to_datetime(df['measured_time'])
    df.set_index('measured_time', inplace=True)

    # Drop rows with missing values in 'in_temperature'
    df = df.dropna(subset=['in_temperature'])
    
    # Ensure enough data for decomposition
    if len(df) < 24:  # Assuming a period of 12, need at least 2 cycles
        raise HTTPException(status_code=400, detail="Not enough data for seasonal decomposition (requires at least 24 observations)")

    # Perform decomposition
    decomposition = seasonal_decompose(df['in_temperature'], model='additive', period=12)

    ### 시각화 코드 ###
    # Plotting the decomposition
    fig, (ax1, ax2, ax3, ax4) = plt.subplots(4, 1, figsize=(12, 8), sharex=True)

    ax1.set_title("Seasonal Decomposition of In Temperature")
    ax1.plot(df['in_temperature'], label='Original')
    ax1.legend(loc='upper left')

    ax2.plot(decomposition.trend, label='Trend', color='orange')
    ax2.legend(loc='upper left')

    ax3.plot(decomposition.seasonal, label='Seasonal', color='green')
    ax3.legend(loc='upper left')

    ax4.plot(decomposition.resid, label='Residual', color='red')
    ax4.legend(loc='upper left')

    plt.tight_layout()
    plt.show()

    # Prepare result for response
    result = {
        "trend": decomposition.trend.dropna().to_dict(),
        "seasonal": decomposition.seasonal.dropna().to_dict(),
        "residual": decomposition.resid.dropna().to_dict(),
    }
    
    print(result)
    
    return result