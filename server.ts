require('dotenv').config();
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as Static from 'koa-static';
import { MongoClient, Db, Collection, Cursor } from 'mongodb';
// import * as crypto from 'crypto-ts';
import * as bodyparser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as sha256 from 'sha256';

const url: string = 'mongodb://localhost:27017';
const DB: string = 'auth';

const app: Koa = new Koa();

const router: Router = new Router();

const port: string = process.env.PORT || String(5001);

interface Account {
  id: string;
  hspw: string;
}

// app.use(logger());

app.use(bodyparser());

app.use(router.routes());

// router.get('/', (ctx, next) => {
//   // console.log('test :', test);
//   // console.log('SHA256("test") :', crypto.SHA256('test'));
//   // console.log('crypto.aes() :', crypto.AES.encrypt('test', 'koa'));
//   // // ctx.body = crypto.SHA256('test');
//   // ctx.body = crypto.AES.encrypt('test', 'koa');
//   console.log('sha256(test) :', sha256('test'));
//   ctx.body = sha256('test');
// });

router.post('/signup', async (ctx, next) => {
  const { id } = ctx.request.body;
  const { pw } = ctx.request.body;
  const hspw = sha256(pw);
  console.log('id :', id);
  console.log('pw :', pw);
  console.log('hspw :', hspw);
  const client: MongoClient = await MongoClient.connect(url);
  const db: Db = await client.db(DB);
  const col: Collection = await db.collection<Account>('account');
  const result = await col.insert({ id: id, hspw: hspw });
  console.log('result :', result);
});

router.post('/login', async (ctx, next) => {
  try {
    const { id } = ctx.request.body;
    const { pw } = ctx.request.body;
    const hspw = sha256(pw);
    console.log('id :', id);
    console.log('pw :', pw);
    console.log('hspw :', hspw);
    const client: MongoClient = await MongoClient.connect(url);
    const db: Db = await client.db(DB);
    const col: Collection = await db.collection<Account>('account');
    const cursor = await col.findOne({ id: id }).then(doc => doc.hspw);
    client.close();
    console.log('hspw :', hspw);
    console.log('curs :', cursor);
    if (hspw === cursor) {
      console.log(`true`);
    } else {
      console.log('false');
    }
    ctx.redirect('/result/success');
  } catch (err) {
    console.log('err :', err);
    ctx.redirect('/result/fail');
  }
});

router.get('/result/:name', (ctx, next) => {
  const { name } = ctx.params;
  ctx.body = name;
});

app.listen(port, () => {
  console.log('server running on port ' + port);
});
