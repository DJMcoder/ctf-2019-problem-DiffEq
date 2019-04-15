"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Renders the frames. Nice try, no answer here.
 * Positions in meters (m).
 * Velocities in meters per second (m/s).
 * Accelerations in meters per second squared (m/s/s).
 * Masses in kilograms (kg).
 *
 * @author David Melisso
 * @version 02/17/19
 */
const G = 1e-11; // gravitational constant. may or may not be made up.
class CollisionError extends Error {
    constructor() {
        super('A collision occurred.');
        this.name = 'CollisionError';
    }
}
class Body {
    constructor(initial_x_position, initial_y_position, initial_x_velocity, initial_y_velocity, mass) {
        this.position = {
            x: initial_x_position,
            y: initial_y_position,
        };
        this.velocity = {
            x: initial_x_velocity,
            y: initial_y_velocity,
        };
        this.mass = mass;
    }
    impactOfOtherBody(body) {
        const x_distance = this.position.x - body.position.x;
        const y_distance = this.position.y - body.position.y;
        const distance = Math.sqrt(x_distance * x_distance + y_distance * y_distance);
        if (distance == 0) {
            throw new CollisionError();
        }
        const magnitude = -body.mass / (distance * distance * distance);
        return {
            x: magnitude * x_distance,
            y: magnitude * y_distance,
        };
    }
    impactOfOtherBodies(bodies) {
        let x_acceleration = 0;
        let y_acceleration = 0;
        for (const body of bodies) {
            try {
                const impact = this.impactOfOtherBody(body);
                x_acceleration += impact.x;
                y_acceleration += impact.y;
            }
            catch (e) {
                if (e.name = 'CollisionError') {
                    // collision occurred
                    // option: combine mass and throw out other body
                    // other option: do nothing
                }
                else {
                    throw e;
                }
            }
        }
        return {
            x: x_acceleration,
            y: y_acceleration,
        };
    }
    iterateVelocityAndPosition(x_acceleration, y_acceleration, time_change) {
        this.velocity.x += x_acceleration * time_change;
        this.velocity.y += y_acceleration * time_change;
        this.position.x += this.velocity.x * time_change;
        this.position.y += this.velocity.y * time_change;
    }
    toFrame() {
        let { position, velocity, mass } = this;
        position = Object.assign({}, position);
        velocity = Object.assign({}, velocity);
        return { position, velocity, mass };
    }
}
exports.Body = Body;
function render(initial_bodies, time_interval, duration, gravitational_constant, number_of_frames) {
    const bodies = initial_bodies;
    const rendered_frames = [];
    function iterateBodies() {
        const changes = [];
        // calculate all changes
        for (const i in bodies) {
            changes[i] = bodies[i].impactOfOtherBodies(bodies);
        }
        // update using changes
        for (const i in bodies) {
            const change = changes[i];
            bodies[i].iterateVelocityAndPosition(change.x * gravitational_constant, change.y * gravitational_constant, time_interval);
        }
    }
    let current_time = 0;
    let frame_interval = duration / (number_of_frames - 1);
    let next_frame_time = 0;
    while (current_time < duration) {
        if (number_of_frames > 2 && current_time > next_frame_time) {
            const frame = Array.from(bodies).map(body => body.toFrame());
            rendered_frames.push(frame);
            next_frame_time += frame_interval;
        }
        iterateBodies();
        current_time += time_interval;
    }
    if (rendered_frames.length < number_of_frames) {
        rendered_frames.push(bodies.map(body => body.toFrame()));
    }
    return rendered_frames;
}
exports.render = render;
