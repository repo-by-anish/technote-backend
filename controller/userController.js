const User = require("../models/User");
const Note = require("../models/Note");
const bcrypt = require('bcrypt');

const getAllUser = async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: "No user Found" })
    } else {
        res.json(users)
    }
}


const createNewUser = async (req, res) => {

    const { username, password, roles } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All feild are required" });
    }

    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ message: "Duplicate Username" })
    }

    //hash password

    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = (!Array.isArray(roles) || !roles.length) ?
        { username, "password": hashedPwd } :
        { username, "password": hashedPwd, roles }

    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ message: "new user created" });
    } else {
        res.status(400).json({ message: "Receved Invalid user data" });
    }

}


const updateUser = async (req, res) => {

    const { id, username, active, roles, password } = req.body;

    if (!id || !username || !Array.isArray(roles) || !roles.length) {
        return res.status(401).json({ message: "All feild is required" });
    }

    const user = await User.findById(id);
    if (!user) {
        return res.status(400).json({ message: "user not found" });
    }

    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();
    // Allow update to the original user 
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate username" });
    }
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        user.password = await bcrypt(password, 10)
    }
    const updatedUser = await user.save()
    res.json({ message: `${updatedUser.username} updated` });
}


const deleteUser = async (req, res) => {

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Id is required" });

    }
    const note = await Note.findOne({ user: id }).lean().exec();

    if (note) {
        return res.status(400).json({ message: "User has assigned notes" });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        res.status(400).json({ message: "No user found" })
    }

    const result = await user.deleteOne();

    const reply = `Username ${result.username} with id ${result._id} is deleted`
    res.status(200).json({ message: reply });

}


module.exports = {
    getAllUser,
    createNewUser,
    updateUser,
    deleteUser
}