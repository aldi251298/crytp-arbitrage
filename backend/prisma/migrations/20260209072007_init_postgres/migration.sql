-- CreateTable
CREATE TABLE "Wallet" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 10000.0,
    "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);
