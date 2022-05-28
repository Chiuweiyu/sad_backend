const db = require("../db");
const DatabaseError = require("../errors/DatabaseError");
const bcrypt = require('bcrypt');
const saltRounds = 10;


const verify_login = async (req, res, next)  => {
    let {userName, password} = req.body;
    let cmd = "SELECT * FROM users WHERE user_name=$1";

    const result = await db.query(cmd, [userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    if(result.rows.length == 0){
        res.status(400).send('This account does not exist.');
    }
    else{
        if (bcrypt.compareSync( password, result.rows[0].pwd)){
            res.status(200).send('OK');
        }
        else{
          res.status(403).send('Password is not correct.');
        }
    }
};

const register = async (req, res, next) => {
    let {userName, password} = req.body;
    
    let cmd = "SELECT * FROM users WHERE user_name=$1";
    let result = await db.query(cmd, [userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    if(result.rows.length != 0){
        res.status(400).send('Account exists.');
    } 
    else{
        password = bcrypt.hashSync(password, saltRounds);
        cmd = "INSERT INTO users VALUES ($1, $2, 1, 0)" ;
        await db.query(cmd, [userName, password]).catch((err) => {
            throw new DatabaseError("Something Went Wrong", err);
        });
        res.status(200).send('OK');
    }
};


module.exports = {
    verify_login,
    register
};


