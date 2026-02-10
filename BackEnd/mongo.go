package main

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MI *mongo.Client

func ConnectMongo() {
	uri := "mongodb://admin_kmitl:kmitl123@100.118.210.62:27017/LoRa"
	clientOptions := options.Client().ApplyURI(uri)

	// เชื่อมต่อ
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// เช็คว่าเชื่อมติดไหม (Ping)
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal("❌ Ping Failed: ", err)
	}

	fmt.Println("✅ Connected to MongoDB!")

	// ⚠️ สำคัญ: เอา client ที่เชื่อมได้แล้ว ยัดใส่ตัวแปร Global MI
	MI = client
}
