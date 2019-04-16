const exampleBody = {
    position: {
        x: 150,
        y: 150,
    },
    velocity: {
        x: 0,
        y: -15,
    },
    mass: 10000000
}

const exampleBody2 = {
    position: {
        x: 250,
        y: 150,
    },
    velocity: {
        x: 0,
        y: 300,
    },
    mass: 600000
}

function renderAndPlay(initial_bodies, time_interval, duration, gravitational_constant, number_of_frames) {
    disableForms()
    
    $('body').addClass('disabled');

    $.ajax({
        url: '/render',
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            initial_bodies,
            time_interval,
            duration,
            gravitational_constant,
            number_of_frames,
        }),
        contentType: 'application/json; charset=utf-8'
    })
    .then(function (response) {
        $('body').removeClass('disabled');
        drawFrames(response.rendered_frames, duration/number_of_frames);
        console.log(response.inputs)
    })
    .catch(error => {
        console.error(error);
        enableForms()
    });
}

// renderAndPlay([exampleBody,exampleBody2], 0.01, 10, 1, 1000)

var canvas = $('canvas')[0];
var ctx = canvas.getContext("2d");
var NUM_COLORS = 20;
var colors = [];
var displayBodies = [];
var BIGGEST_RADIUS = 25;

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function fillColors() {
    for (var i = 0; i < NUM_COLORS; i++) {
        colors.push(getRandomColor());
    }
}

fillColors();

// https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawFrame(frame) {
    clearCanvas();

    var masses = [];
    for (var index in frame) {
        masses.push(frame[index].mass);
    }

    var largest_mass = Math.max(...masses)

    for (var index in frame) {
        var body = frame[index];

        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, Math.max(BIGGEST_RADIUS*body.mass/largest_mass, 5), 0, 2 * Math.PI);
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
    }
}

function delay(delay) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, delay);
    });
}

function enableForms() {
    $('input').prop('disabled', false);
}

function disableForms() {
    $('input').prop('disabled', true);
}

var timeout;

function drawFrameHelper(frames, frame_interval, index) {
    drawFrame(frames[index]);
    if (index >= frames.length) {
        enableForms();
        return;
    }
    timeout = setTimeout(function() {
        drawFrameHelper(frames, frame_interval, index+1);
    }, frame_interval*1000);
}

function drawFrames(frames, frame_interval) {
    drawFrameHelper(frames, frame_interval, 0);
} 

var default_limits = {
    position: {
        x: { max: 400, min: 0 },
        y: { max: 400, min: 0 },
    },
    velocity: {
        x: { max: 10, min: -10 },
        y: { max: 10, min: -10 },
    },
    mass: { max: 100000, min: 100 }
}

// https://gist.github.com/kerimdzhanov/7529623
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

$('#add-body').submit(function(e) {
    e.preventDefault();
    
    var body = {
        position: {
            x: parseFloat($('#px').val()),
            y: parseFloat($('#py').val())
        },
        velocity: {
            x: parseFloat($('#vx').val()),
            y: parseFloat($('#vy').val())
        },
        mass: parseFloat($('#mass').val()),
    }

    displayBodies.push(body);
    drawFrame(displayBodies);

    $('#px').val(randomBetween(default_limits.position.x.min, default_limits.position.x.max).toFixed(4))
    $('#py').val(randomBetween(default_limits.position.y.min, default_limits.position.y.max).toFixed(4))
    $('#vx').val(randomBetween(default_limits.velocity.x.min, default_limits.velocity.x.max).toFixed(4))
    $('#vy').val(randomBetween(default_limits.velocity.y.min, default_limits.velocity.y.max).toFixed(4))
    $('#mass').val(randomBetween(default_limits.mass.min, default_limits.mass.max).toFixed(4))
});

$('#render').submit(function(e) {
    e.preventDefault();

    var time_interval = parseFloat($('#time_interval').val());
    var duration = parseFloat($('#duration').val());
    var gravitational_constant = parseFloat($('#gravitational_constant').val());
    var number_of_frames = parseInt($('#number_of_frames').val());

    renderAndPlay(displayBodies, time_interval, duration, gravitational_constant, number_of_frames)
    displayBodies = [];
})