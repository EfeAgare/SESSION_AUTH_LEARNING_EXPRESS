import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 9000;

const app = express();

const NODE_ENV = 'development';

const IN_PROD = NODE_ENV === 'production';

const dbUsers = [
  { id: '1', email: 'faith@gamil.com', name: 'Faith', password: 'secret' },
  { id: '2', email: 'efe@gamil.com', name: 'efe', password: 'secret1' },
  { id: '3', email: 'divine@gamil.com', name: 'favour', password: 'secret2' }
];

// MIDDLE_WARE

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

const redirectLogin = (req, res, next) => {
  console.log(req.session.userId);
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  console.log(req.session.cookie);
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    next();
  }
};

app.use(
  session({
    name: process.env.SESSION_NAME,
    resave: false,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    cookie: {
      maxAge: parseInt(process.env.SESSION_LIFETIME),
      sameSite: true,
      secure: IN_PROD
    }
  })
);

app.get('/', (req, res) => {
  const { userId } = req.session;

  res.send(` 
  ${
    !userId
      ? `<h1>Welcome</h1>
    <a href='/login'>Login</a>
    <a href='/register'>Register</a>`
      : `<a href='/home'>Home</a>
    <form method='post' action='/logout'>
    <button>Logout </button>
    </form> `
  }
  `);
});

app.get('/login', redirectHome, (req, res) => {
  res.send(`
  <h1>LOGIN</h1>
  <a href='/home'>Home</a>
    <form method='post' action='/login'>
    <input type="email" name="email" id="" placeholder='Email' required>
    <input type="password" name="password" id="" placeholder='Password' required>
    <input type="submit" value="Submit">
    </form>
    <a href='/register'>Register</a>
  `);
});

app.get('/register', redirectHome, (req, res) => {
  res.send(`
  <h1>REGISTER</h1>
  <a href='/home'>Home</a>
    <form method='post' action='/register'>
    <input type="text" name="username" id="" placeholder='Name' required>
    <input type="email" name="email" id="" placeholder='Email' required>
    <input type="password" name="password" id="" placeholder='Password' required>
    <input type="submit" value="Submit">
    </form>
    <a href='/login'>Login</a>
  `);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
 
  if (email && password) {
    const user = dbUsers.filter(user => user.email === email && user.password === password);
    if (user) {
      req.session.userId = user[0].id;
      return res.redirect('/home');
    }
  } else {
    res.redirect('/login');
  }
});

app.post('/register', redirectHome, (req, res) => {
  const { name, email, password } = req.body;

  if (name && email && password) {
    const exists = dbUsers.find(user => user.email === email);

    if (!exists) {
      const user = {
        id: `${dbUsers.length + 1}`,
        email: email,
        name: name,
        password: password
      };

      req.session.userId = user.id;
      dbUsers.push(user);
      return res.redirect('/home ');
    }
  }
  res.redirect('/register ');
});

app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/home');
    }

    res.clearCookies(process.env.SESSION_NAME);
    res.redirect('/login');
  });
});

app.get('/home', redirectLogin, (req, res) => {
  const user = dbUsers.find(user => user.id === req.session.userId);
  res.send(` 
  
    <h1>Welcome Home</h1>
    <a href='/'>Main</a>
    <ul>
    <li>Name: ${user.name}</li>
    <li>Email: ${user.email}</li>
    </ul>
 
  `);
});

app.get('/', (req, res) => {
  console.log(req.session);
});

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
