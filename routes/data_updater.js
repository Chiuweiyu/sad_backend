const db = require("../db");
const DatabaseError = require("../errors/DatabaseError");
const { _getMySheet, _getfoodType } = require('./info_getter.js');



const postUpdateSheet = async (req, res, next) => {
    let { userName, data } = req.body;
    if (!userName || !data) {
        res.status(400).send('Missing parameters.');
        return;
    }

    let cmd = "DELETE FROM sheets WHERE belongs_to=$1";
    await db.query(cmd, [userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    await Promise.all(data.map(async (sheet) => {
        cmd = "INSERT INTO sheets(title, sheet_type, left_value, right_value, belongs_to) " +
            "VALUES($1, $2, $3, $4, $5)";
        let parameters = [sheet.title, sheet.type, sheet.left, sheet.right, userName]
        await db.query(cmd, parameters).catch((err) => {
            console.log(err)
            throw new DatabaseError("Something Went Wrong", err);
        });
    }));
    res.status(200).send('OK');
}


const postCreateFile = async (req, res, next) => {
    let { userName, image, restaurant, food, price, type, place, likeVal, spicyVal, chosenSheet, reminder } = req.body;
    if (!userName || !image || !restaurant || !food || !type || !place || !chosenSheet || !reminder) {
        res.status(400).send('Missing parameters.');
        return;
    }

    let create_time = (new Date(Date.now()) + '').split(" ")
    let record_date = create_time[3] + "-" + create_time[1] + "-" + create_time[2];
    let record_time = create_time[4];
    let photo = image;
    let restaurant_name = restaurant;
    let food_name = food;
    let tag = type;
    let exist_food_tag = await _getfoodType(withTag = false);
    if (exist_food_tag.indexOf(tag) == -1) {
        //add food type
        await db.query("INSERT INTO food_tags(tag_name) VALUES ($1)", [tag]).catch((err) => {
            throw new DatabaseError("Something Went Wrong", err);
        });
    }

    let mysheet = await _getMySheet(userName);
    let sheet_value = {}
    for (let i = 0; i < mysheet.length; i++) {
        if (chosenSheet.length <= i) { //chosenSheet's values loss
            sheet_value[mysheet[i].gid] = null;
        }
        sheet_value[mysheet[i].gid] = chosenSheet[i];
    }
    sheet_value = JSON.stringify(sheet_value);

    let cmd = "INSERT INTO records(user_name, record_date, record_time, photo, restaurant_name, food_name,  likeVal, spicyVal, tag, reminder, sheet_value, price, place) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)"
    let parameters = [userName, record_date, record_time, photo, restaurant_name, food_name, likeVal, spicyVal, tag, reminder, sheet_value, price, place]
    await db.query(cmd, parameters).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    let user_info = await db.query("SELECT * FROM users WHERE user_name=$1", [userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    // update user_info
    user_info = user_info.rows[0];
    let record_amount = await db.query("SELECT COUNT(*) FROM records WHERE user_name=$1", [userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });
    record_amount = parseInt(record_amount.rows[0].count);

    await db.query("UPDATE users SET record=$1 WHERE user_name=$2", [record_amount, userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    res.status(200).send("OK");
}

module.exports = {
    postUpdateSheet,
    postCreateFile
};

