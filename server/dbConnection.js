const oracledb = require('oracledb');

const connectOptions = {
    user: "\"c##frc\"",
    password: "\"frc\"",
    connectString: "localhost/xe"
};

let pool;

async function getConnection() {
    if (!pool) {
        pool = await oracledb.createPool(connectOptions);
    }

    return pool.getConnection();
}

process.on("exit", async () => {
    if (pool) {
        try {
            await pool.close();
        } catch (err) {
            console.error(err);
        }
    }
})

async function uploadDataToDB() {
    const connection = await getConnection();
    try {
        const result = await connection.execute(
                `CREATE TABLE "c##frc"."T_TEST" (    
                    "Number" NUMBER, 
                    "A" NUMBER, 
                    "B" NUMBER, 
                    "C" NUMBER
                ) 
                ORGANIZATION EXTERNAL (
                    TYPE ORACLE_LOADER
                    DEFAULT DIRECTORY "LOAD_DIR"
                    ACCESS PARAMETERS (
                        RECORDS DELIMITED BY NEWLINE
                        CHARACTERSET CL8MSWIN1251
                        SKIP 1
                        BADFILE load_dir:'test_bad.txt'
                        DISCARDFILE load_dir:'test_dis.txt'
                        LOGFILE load_dir:'test_log.txt'
                        FIELDS TERMINATED BY ";"  
                        LRTRIM
                        MISSING FIELD VALUES ARE NULL    
                    )
                    LOCATION (
                        "LOAD_DIR":'test.csv'
                    )
                )
                REJECT LIMIT UNLIMITED`
        );
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

async function selectT_GROUP() {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
        `SELECT group_data_id, branch_office_name, price_category_name 
            FROM T_GROUP g
            JOIN T_BRANCH_OFFICE b
            ON g.branch_office_id = b.branch_office_id
            JOIN T_PRICE_CATEGORY p
            ON g.price_category_id = p.price_category_id
            ORDER BY group_data_id
        `,
        [],
        {
          maxRows: 100
        });
  
        return result.rows.map(([id, branchOffice, priceCategory]) => ({
            id,
            branchOffice,
            priceCategory
        }));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

async function selectT_GROUPWithId(id) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
        `SELECT group_data_id, branch_office_name, price_category_name 
            FROM T_GROUP g
            JOIN T_BRANCH_OFFICE b
            ON g.branch_office_id = b.branch_office_id
            JOIN T_PRICE_CATEGORY p
            ON g.price_category_id = p.price_category_id
            WHERE g.group_data_id = :id
        `,
        [id],
        {
          maxRows: 100
        });
  
        return result.rows.map(([id, branchOffice, priceCategory]) => ({
            id,
            branchOffice,
            priceCategory
        }))[0];
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

async function selectT_GROUP_DATA(id) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM T_GROUP_DATA
                WHERE GROUP_DATA_ID = :id
                ORDER BY year, month`,
            [id],
            {
            maxRows: 100
            }
        );
  
        return result.rows.map(([id, volume, year, month]) => ({
            id,
            month,
            year,
            volume: volume.toFixed(3)
        }));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

async function runProcedureParamTest(id) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `begin
                "c##frc".pk_frc.param_test(p_group_data_id => :id,
                                p_year_init => 2017);
            end;`,
            [id],
            {}
        );
  
        return result ? true : false;
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

async function runProcedurePredict(id, yearInit, monthInit, monthsToForecast) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `
                begin
                    "c##frc".pk_frc.predict(
                        p_serie_id => :id,
                        p_year_init => :yearInit,
                        p_month_init => :monthInit,
                        p_predict_num => :monthsToForecast);
                end;
            `,
            [id, yearInit, monthInit, monthsToForecast],
            {}
        );
  
        return result ? true : false;
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

async function selectT_TIME_SERIE(id) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT time_serie_id, group_data_id, alpha, beta, gamma, round(mse, 3), round(mape, 3)
                FROM T_TIME_SERIE ts
                JOIN T_PARAM_SET p
                ON ts.param_set_id = p.param_set_id
                WHERE GROUP_DATA_ID = :id
                ORDER BY mape
                FETCH FIRST 10 ROWS ONLY`,
            [id],
            {
            maxRows: 1000
            }
        );
  
        return result.rows.map(([time_serie_id, group_data_id, alpha, beta, gamma, mse, mape]) => ({
            time_serie_id, 
            group_data_id,
            alpha: alpha.toFixed(1), 
            beta: beta.toFixed(1), 
            gamma: gamma.toFixed(1), 
            mse: mse.toFixed(3), 
            mape: mape.toFixed(3)
        }));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

async function selectT_Forecast(id) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT year, month, real_value, round(smooth_value, 3), round(predict_value, 3),
                LAG(real_value, 12) OVER(ORDER BY year, month) prev_real_value
                FROM T_Forecast
                WHERE Time_SERIE_ID = :id
                ORDER BY year, month`,
            [id],
            {
            maxRows: 1000
            }
        );
  
        return result.rows.map(([year, month, real_value, smooth_value, predict_value, prev_real_value]) => ({
            year, 
            month, 
            real_value: real_value && real_value.toFixed(3), 
            smooth_value: smooth_value && smooth_value.toFixed(3), 
            predict_value: predict_value && predict_value.toFixed(3),
            prev_real_value: prev_real_value && prev_real_value.toFixed(3)
        }));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.close();
    }
}

module.exports = {
    uploadDataToDB,
    selectT_GROUP,
    selectT_GROUPWithId,
    selectT_GROUP_DATA,
    selectT_TIME_SERIE,
    selectT_Forecast,
    runProcedureParamTest,
    runProcedurePredict
};