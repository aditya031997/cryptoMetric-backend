const { DataTypes } = require('sequelize')
const { connectToDatabase } = require('../database/db');

async function tableModel() {
    const sequalize = connectToDatabase({
        logging: console.log
    })

    const Table = (await sequalize).define('Arya', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        contactNo: {
            type: DataTypes.STRING,
            allowedNull: false
        },

    })

    await Table.sync({ alter: true });

    return Table
}



module.exports = tableModel