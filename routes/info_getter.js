const db = require("../db");
const DatabaseError = require("../errors/DatabaseError");


const getUser = async (req, res, next)  => {
    let {userName} = req.body;
    let cmd = "SELECT * FROM users WHERE user_name=$1";

    const result = await db.query(cmd, [userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    if(result.rows.length == 0){
        res.status(400).send('This account does not exist.');
    }
    else{
        res.json({
            name: result.rows[0].user_name,
            level: result.rows[0].account_level,
            record: result.rows[0].record
        })
    }
};

const getListData  = async (req, res, next)  => {
    let {userName, tag, foodKeyword, startDay, endDay} = req.body;
    startDay = date_formated(startDay, in_format="space", out_format="dash");
    endDay = date_formated(endDay, in_format="space", out_format="dash");

    let record_query_cmd = "SELECT * FROM records WHERE user_name=$1 AND record_date >= $2 AND record_date <= $3";
    let record_query_parameters = [userName, startDay, endDay];
    if(tag){
        record_query_cmd = record_query_cmd + " AND tag=$4";
        record_query_parameters.push(tag)
    }
    if(foodKeyword){
        record_query_cmd = record_query_cmd + ` AND (food_name LIKE '%${foodKeyword}%')`;
    }
    record_query_cmd = record_query_cmd + "ORDER BY (record_date,record_time) DESC"
    let record = await db.query(record_query_cmd, record_query_parameters).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });
    record = record.rows;
    let to_return = []
    for(let i = 0; i<record.length; i++){
        let sheet_query_cmd = "SELECT * FROM sheets WHERE belongs_to=$1 AND sheet_type='2choices'";
        let sheet = await db.query(sheet_query_cmd, [record[i].user_name]).catch((err) => {
            throw new DatabaseError("Something Went Wrong", err);
        });
        sheet = sheet.rows;
        record[i]["stringObjects"] = [];
        for(let j=0; j < sheet.length; j++){
            record[i]["stringObjects"].push({
                "title": sheet[j].title, 
                "value": stringifiedJson_to_sheetValue(sheet[j].sheet_id, record[i].sheet_value),
                "sheet_id": sheet[j].sheet_id
            });
        }

        sheet_query_cmd = "SELECT * FROM sheets WHERE belongs_to=$1 AND sheet_type<>'2choices'";
        sheet = await db.query(sheet_query_cmd, [record[i].user_name]).catch((err) => {
            throw new DatabaseError("Something Went Wrong", err);
        });
        sheet = sheet.rows;
        record[i]["linearObjects"] = [];
        for(let j=0; j < sheet.length; j++){
            record[i]["linearObjects"].push({
                "title": sheet[j].title, 
                "value": stringifiedJson_to_sheetValue(sheet[j].sheet_id, record[i].sheet_value),
                "sheet_id": sheet[j].sheet_id
            });
        }

        record[i].record_date = date_formated(record[i].record_date, in_format="db", out_format="space");
        to_return.push({
            "date": record[i].record_date,
            "time": record[i].record_time,
            "photo": record[i].photo,
            "restaurant": record[i].restaurant_name,
            "food": record[i].food_name,
            "likeVal": record[i].likeval, //喜好程度
            "spicyVal": record[i].spicyval, // 辣度
            "linearObjects": record[i]["linearObjects"],
            "stringObjects": record[i]["stringObjects"],
            "foodTag": record[i].tag,
            "reminder": record[i].reminder,
            "gid": record[i].record_id
        })
    
    }
    res.json(to_return)
    
}


const getfoodType = async (req, res, next)  => {
    to_return = await _getfoodType(withTag=true);
    res.json(to_return)
}

const _getfoodType = async (withTag=false) => {

    let cmd = "select * FROM food_tags";
   
    let tags = await db.query(cmd).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });
    to_return = []
    tags.rows.forEach(element => {
        if(withTag){
            to_return.push({
                "title": element.tag_name,
                "gid": element.tag_id
            });
        }
        else{
            to_return.push(element.tag_name);
        }
    });

    return to_return;
}




const getDailyData  = async (req, res, next)  => {
    let {userName, foodKeyword, startDay, endDay} = req.body;

    startDay = date_formated(startDay, in_format="space", out_format="dash");
    endDay = date_formated(endDay, in_format="space", out_format="dash");

    let record_query_cmd = "SELECT * FROM records WHERE user_name=$1 AND record_date >= $2 AND record_date <= $3 ";
    let record_query_parameters = [userName, startDay, endDay];
   
    if(foodKeyword){
        record_query_cmd = record_query_cmd + ` AND (food_name LIKE '%${foodKeyword}%')`;
    }

    record_query_cmd = record_query_cmd + " ORDER BY (record_date,record_time) DESC"
    let record = await db.query(record_query_cmd, record_query_parameters).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });
    record = record.rows;

    let dateSet = [];
    let to_return = [];

    for(let i = 0; i<record.length; i++){

        let date = date_formated(record[i].record_date, in_format="db", out_format="space");
        let loc = dateSet.indexOf(date);
        if(loc == -1){
            dateSet.push(date);
            to_return.push({
                "date": date,
                "year":'2022',
                "files":[]
            })
            loc = dateSet.length-1;
        }
        to_return[loc]["files"].push({
            "photo": record[i].photo,
            "gid": record[i].record_id,
        })
    }
    res.json(to_return)
}


const getDetailDataByGid  = async (req, res, next)  => {
    let {gid} = req.body;
    gid = parseInt(gid);

    let record_query_cmd = "SELECT * FROM records WHERE record_id=$1";
   
    let record = await db.query(record_query_cmd, [gid]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });

    if (record.rows.length == 0){
        res.status(404).send('This record does not exist.');
    }
    else{
        record = record.rows[0];
        let sheet_query_cmd = "SELECT * FROM sheets WHERE belongs_to=$1 AND sheet_type='2choices'";
        let sheet = await db.query(sheet_query_cmd, [record.user_name]).catch((err) => {
            throw new DatabaseError("Something Went Wrong", err);
        });

        sheet = sheet.rows;
        record["stringObjects"] = [];
        for(let j=0; j < sheet.length; j++){
            record["stringObjects"].push({
                "title": sheet[j].title, 
                "value": stringifiedJson_to_sheetValue(sheet[j].sheet_id, record.sheet_value),
                "sheet_id": sheet[j].sheet_id
            });
        }

        sheet_query_cmd = "SELECT * FROM sheets WHERE belongs_to=$1 AND sheet_type<>'2choices'";
        sheet = await db.query(sheet_query_cmd, [record.user_name]).catch((err) => {
            throw new DatabaseError("Something Went Wrong", err);
        });

        sheet = sheet.rows;
        record["linearObjects"] = [];
        for(let j=0; j < sheet.length; j++){
            record["linearObjects"].push({
                "title": sheet[j].title, 
                "value": stringifiedJson_to_sheetValue(sheet[j].sheet_id, record.sheet_value),
                "sheet_id": sheet[j].sheet_id
            });
        }

        record.record_date = date_formated(record.record_date, in_format="db", out_format="space");
        to_return = {
            "date": record.record_date,
            "time": record.record_time,
            "photo": record.photo,
            "restaurant": record.restaurant_name,
            "food": record.food_name,
            "likeVal": record.likeval, //喜好程度
            "spicyVal": record.spicyval, // 辣度
            "linearObjects": record["linearObjects"],
            "stringObjects": record["stringObjects"],
            "foodTag": record.tag,
            "reminder": record.reminder,
            "gid": record.record_id
        }
        res.json(to_return);
    }
    
}
    

const getMySheet = async (req, res, next) =>{ 
    let {userName} = req.body;

    to_return = await _getMySheet(userName);
   
    res.json(to_return);
}



const _getMySheet = async (userName) =>{ 
    let cmd = "SELECT * FROM sheets WHERE belongs_to=$1";
    sheet = await db.query(cmd, [userName]).catch((err) => {
        throw new DatabaseError("Something Went Wrong", err);
    });
    to_return = [];
    (sheet.rows).forEach(entry => {
        to_return .push({
            "title": entry.title,
            "type": entry.sheet_type,
            "left": entry.left_value,
            "right": entry.right_value,
            "gid": entry.sheet_id
        });
    });

    return to_return
}

function date_formated(datestr, in_format, out_format){
    // datestr: 2022-Jan-12, Dec 25, 2022-02-26T16:00:00.000Z ...; 
    // in_format: ["dash", "space", "db"]
    // out_format: ["dash", "space"]

    if (in_format == "db"){
        let split = (datestr + "").split(" ")
        datestr =  "2022-" +  split[1] + "-" +  split[2];
        in_format = "dash";
    }
  
    if(datestr.indexOf("-") != -1){
        if(out_format == "dash"){
            return datestr
        }
        else{
            let split = datestr.split("-");
            return split[1] + " " + split[2];
        }
    }
    else{
        if(out_format == "space"){
            return datestr
        }
        else{
            let split = datestr.split(" ");
            return "2022-" + split[0] + "-" + split[1];
        }
        
    }
}

const stringifiedJson_to_sheetValue = (sheet_id, string) =>{
    
    let obj = JSON.parse(string);
    if (obj['' + sheet_id] != undefined){
        return obj['' + sheet_id];
    }
    else{
        return null;
    }
    
}

module.exports = {
    getUser,
    getListData,
    getfoodType,
    _getfoodType,
    getDailyData,
    getDetailDataByGid,
    getMySheet,
    _getMySheet
};
