package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoInstance struct เก็บทั้ง Client และ Database
type MongoInstance struct {
	Client *mongo.Client
	DB     *mongo.Database
}

var MI MongoInstance

func ConnectMongo() {
	// ⚠️ แก้ authSource=LoRa ตามที่คุณตั้งไว้ตอนสร้าง User
	uri := "mongodb://admin_kmitl:kmitl123@100.118.210.62:27017/LoRa?authSource=LoRa"

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("❌ Connect Error: ", err)
	}

	// Ping Check
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("❌ Ping Failed: ", err)
	}

	fmt.Println("✅ Connected to MongoDB!")

	// เก็บลงตัวแปร Global
	MI = MongoInstance{
		Client: client,
		DB:     client.Database("LoRa"), // เลือก Database ชื่อ "LoRa"
	}
}
