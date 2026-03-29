package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoInstance struct {
	Client *mongo.Client
	DB     *mongo.Database
}

var MI MongoInstance

func ConnectMongo() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		log.Fatal("❌ MONGO_URI is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("❌ Connect Error: ", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("❌ Ping Failed: ", err)
	}

	fmt.Println("✅ Connected to MongoDB!")

	MI = MongoInstance{
		Client: client,
		DB:     client.Database("LoRa"),
	}
}
