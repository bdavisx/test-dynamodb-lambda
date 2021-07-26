import {ScheduledEvent} from 'aws-lambda'
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {housekeeping} from "./housekeeping";
import {v4 as uuidv4} from "uuid";

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

const downloadTest = () => {
  const docDefinition = {
    content: [{
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 100, '*'],
        body: [
          ['First', 'Second', 'Third', 'Something'],
          ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
          [{ text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Чё']
        ]
      }
    }]
  };
  pdfMake.createPdf(docDefinition)  ;
}

const dynamoDbTableName = process.env['ARTIST_TABLE_NAME'] || 'Artist'

// Full DynamoDB Client
const dynamoDBClient = new DynamoDB({
  region: process.env['REGION'] || 'us-east-1',
});

// Full document client
const dynamoDocumentClient: DynamoDBDocument = DynamoDBDocument.from(dynamoDBClient);

type Brand<K, T> = K & { __brand: T }
      type ArtistId = Brand<string,  'ArtistId'>

export async function handler(event: ScheduledEvent) {
  console.log(JSON.stringify(event, null, 2))

  const artistId: ArtistId = uuidv4() as ArtistId;

  const testData: Artist = {
    id: artistId,
    name: `Some name - ${artistId}`,

    albums: [...Array(2).keys()].map((value, index, array) => {
      let albumName = `Some Album ${index}`;
      const album: Album = {
        id: uuidv4(),
        name: albumName,
        songs: [...Array(2).keys()].map((value, index, array) => {
          const song: Song = {
            id: uuidv4(),
            name: `${albumName} - Song ${index}`
          }
          return song
        })
      }

      return album
    }),
  }

  await dynamoDocumentClient.put({
    TableName: dynamoDbTableName,
    Item: testData
  })

  const returnedData = await dynamoDocumentClient.get({
    TableName: dynamoDbTableName,
    Key: { id: artistId }
  })

  console.log(returnedData)

  const returnedArtist: Artist = returnedData.Item as Artist
  console.warn(returnedArtist)

  console.log('Housekeeping started for Table' + dynamoDbTableName)
  await housekeeping(dynamoDocumentClient, dynamoDbTableName)
  console.log('Housekeeping finished')
}

interface Artist {
  id: ArtistId
  name: string

  albums: Album[]
}

interface Album {
  id: string
  name: string

  songs: Song[]
}

interface Song {
  id: string
  name: string
}
