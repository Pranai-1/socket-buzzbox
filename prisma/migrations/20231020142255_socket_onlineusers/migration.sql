-- CreateTable
CREATE TABLE "OnlineUsers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "socketId" TEXT NOT NULL,

    CONSTRAINT "OnlineUsers_pkey" PRIMARY KEY ("id")
);
