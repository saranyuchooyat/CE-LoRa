package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var db *mongo.Database

func ConnectMongo() {
	uri := "mongodb://admin_kmitl:kmitl123@100.118.210.62:27017/LoRa"
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("❌ Error creating Mongo client:", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal("❌ Error connecting to Mongo:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("❌ Ping to Mongo failed:", err)
	}

	fmt.Println("✅ Connected to MongoDB!")

	db = client.Database("LoRa")
}
