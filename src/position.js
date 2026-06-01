let currentPosition = null;

function hasPosition() {

    return currentPosition !== null;

}

function openPosition(type, price) {

    currentPosition = {

        type: type,

        entry: price,

        time: Date.now()

    };

    console.log('📈 POSITION OPENED');

}

function closePosition() {

    console.log('📉 POSITION CLOSED');

    currentPosition = null;

}

function getPosition() {

    return currentPosition;

}

module.exports = {

    hasPosition,

    openPosition,

    closePosition,

    getPosition

};
