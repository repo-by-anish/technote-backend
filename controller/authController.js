const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: "All feild are required" })
    }
    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) {
        return res.status(401).json({ message: "Unauthorize" });
    }

    const accessToken = jwt.sign(
        {
            UserInfo: {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ accessToken })
}

const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const refreshToken = cookies.jwt
    console.log(cookies);

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (error, decode) => {
            if (error) {
                console.log(error);
                return res.status(403).json({ message: "Forbidden" })
            }
            const foundUser = await User.findOne({ username: decode.username }).exec()

            if (!foundUser) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            )
            res.json({ accessToken })
        }
    )

}

const logOut = (req, res) => {
    const cookies = req.cookies
    if (!cookies) {
        return res.sendStatus(204)
    }
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true
    })
    res.json({ message: "Cookie cleared" });
}

module.exports = {
    login,
    refresh,
    logOut
}
