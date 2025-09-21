const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Favorite = sequelize.define('Favorite', {
        // UserId и ProductId будут добавлены через ассоциации
        // и вместе составят составной первичный ключ
    }, {
        tableName: 'favorites',
        timestamps: true, // Добавим метки времени, чтобы знать, когда товар был добавлен
    });

    return Favorite;
};
