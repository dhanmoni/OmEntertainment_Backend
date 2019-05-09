const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')
const User = mongoose.model('users')
const keys = require('./key')

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('access_token');
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    console.log('checking.......')
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log('jwt paylad ==='.jwt_payload)
        User.findById(jwt_payload.id)
            .then(user => {
                console.log('user===', user)
                if (user) {
                    return done(null, user)
                }
                else {
                    return done(null, false)
                }
            })
            .catch(err => console.log(err))
    }))
}