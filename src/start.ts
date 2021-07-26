import {fromIni} from '@aws-sdk/credential-provider-ini'
import {roleAssumer} from './role-assumer'
import {DynamoDB} from "@aws-sdk/client-dynamodb"; // ES6 import
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb"; // ES6 import

interface Person {
  name: string;
}
interface Lifespan {
  birth: Date;
  death?: Date;
}
type PersonSpan = Person & Lifespan;

const ps: PersonSpan = {
  name: 'Alan Turing',
  birth: new Date('1912/06/23'),
  death: new Date('1954/06/07'),
};

type X = keyof PersonSpan;
const x: X = 'death';



// Full DynamoDB Client
const dynamoDBClient = new DynamoDB({
  region: process.env['REGION'] || 'us-east-1',
  credentials: fromIni({ profile: process.env['PROFILE'], roleAssumer }), // use profile from ~/.aws/config
});

// Full document client
const dynamoDocumentClient = DynamoDBDocument.from(dynamoDBClient);
