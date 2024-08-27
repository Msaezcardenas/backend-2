import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const app = express();

// Al conectar cookieParser con express, podemos gestionar  dentro
// de nuestras, peticiones, elementos correspondientes a cookies

app.use(cookieParser('SECRETHASH'));
app.use(
  session({
    secret: 'secrethash',
    resave: true,
    saveUninitialized: true,
    // cookie: { httpOnly: true, secure: true }, // httpOnly en true no va a poder acceder desde el cliente, secure en true solo se puede acceder desde https
    cookie: { maxAge: 120000 },
  }),
);

app.get('/session', (req, res) => {
  //req.session esto es un objeto que le podemos almacenar info que va a vivir en cada request
  // {}
  if (!req.session.isFirst) {
    req.session.isFirst = true;
    res.send('Bienvenido esta es tu primera vez');
  } else {
    res.send('Ya estuviste aca rey');
  }
});
// 1. -No podemos evitar qe alguien externo altere la cookie, pero al firmarla nos aseguramos que si
//no es exactamente igual a la generada se invalide para eso la FIRMAMOS con un hash

//2. resave -> permite mantener la sesión activa en caso de que la sesión se mantenga inactiva
//3. saveUninitialized -> permite guardar cualquier sesión apun cuando el objeto de sesión no tenga nada por contener

// SI no seteo un tiempo de vida (maxAge) se quedará ahí hasta que alguien la elimine
app.get('/setCookie', (req, res) => {
  res
    // .cookie('nombre de mi cookie', 'este es el valor de mi cookie', { maxAge: 60000 })
    .cookie('nombre de mi cookie', 'este es el valor de mi cookie', { maxAge: 60000, signed: true })
    // configuramos signed en true para firmar nuestra cookie
    .send('Cookie');
});

//aqui obtenemos en este caso todas las cookies y las enviamos al cliente
// si queremos acceder a una cookie en especifica, accedemos a traves req.cookies.nombre_de_la_cookie
app.get('/getCookie', (req, res) => {
  //   res.send(req.cookies);
  // si la cookie se modifico responderá con un false, no podremos acceder
  res.send(req.signedCookies);
});

//eliminar una cookie
app.get('/deleteCookie', (req, res) => {
  res.clearCookie('nombre de mi cookie').send('Cookie eliminada');
});

const USERS = [
  { nombre: 'molu', rol: 'admin' },
  { nombre: 'feli', rol: 'super admin' },
];

app.post('/login', (req, res) => {
  const { usuario } = req.body;

  const userFinded = USERS.find((user) => user.nombre === usuario);
  if (!userFinded) {
    req.session.nombre = usuario;
    req.session.rol = 'invitado';
    return res.send('Bienvenido invitado');
  }
  req.session.username = userFinded.nombre;
  req.session.rol = userFinded.rol;
  res.send('Bienvenido admin');
});

function isAdmin(req, res, next) {
  if (req.session.rol !== 'invitado') {
    return next();
  }
  return res.status(401).send('Manito mio no tienes permisos');
}

app.get('/rutaAdmin', isAdmin, (req, res) => {
  res.send('si ves esto sos admin');
});

app.listen(8080, () => {
  console.log('Servidor corriendo en 8080');
});
