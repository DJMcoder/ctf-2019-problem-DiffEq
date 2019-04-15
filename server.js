"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const render_1 = require("./helpers/render");
const app = express_1.default();
const PORT = 80;
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'static/index.html'));
});
app.post('/render', express_1.default.json(), function (request, response) {
    const { initial_bodies, time_interval, duration, gravitational_constant, number_of_frames } = request.body;
    const bodies = [];
    if (!Array.isArray(initial_bodies)) {
        response.status(400).send('Data formatted incorrectly; initial_bodies should be array.');
        return;
    }
    let i = 0;
    for (const body_info of initial_bodies) {
        const isValid = typeof body_info.position != 'undefined' &&
            typeof body_info.velocity != 'undefined' &&
            eval(`body_info.position.__proto__ == ${body_info.position.__proto__}`);
        typeof body_info.position.x == 'number' &&
            typeof body_info.position.y == 'number' &&
            typeof body_info.velocity.x == 'number' &&
            typeof body_info.velocity.y == 'number' &&
            typeof body_info.mass == 'number';
        if (!isValid) {
            response.status(400).send(`Data formatted incorrectly; the body at position ${i} is not a valid body.`);
            return;
        }
        bodies.push(new render_1.Body(body_info.position.x, body_info.position.y, body_info.velocity.x, body_info.velocity.y, body_info.mass));
        i++;
    }
    if (typeof time_interval != 'number') {
        response.status(400).send('Data formatted incorrectly, time_interval should be a number.');
        return;
    }
    if (typeof duration != 'number') {
        response.status(400).send('Data formatted incorrectly, duration should be a number.');
        return;
    }
    if (typeof gravitational_constant != 'number') {
        response.status(400).send('Data formatted incorrectly, gravitational_constant should be a number.');
        return;
    }
    if (typeof number_of_frames != 'number') {
        response.status(400).send('Data formatted incorrectly, number_of_frames should be a number.');
        return;
    }
    const rendered_frames = render_1.render(bodies, time_interval, duration, gravitational_constant, number_of_frames);
    response.json(rendered_frames);
});
app.use(express_1.default.static('static'));
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
