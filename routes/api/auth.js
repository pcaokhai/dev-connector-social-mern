const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");

const User = require("../../models/User");

const auth = require("../../middleware/auth");

// @route   GET api/auth
// @desc    Get user
// @acess   Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(401).json({ msg: "User not exists" });
    }

    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// @route   post api/auth
// @desc    Authenticate user & get token
// @acess   Public
router.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters."
    ).exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // see if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .send({ errors: [{ msg: "Invalid credentials." }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .send({ errors: [{ msg: "Password not matched." }] });
      }

      // return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 86400 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user });
        }
      );
    } catch (e) {
      // console.log(e.message);
      res.status(500).send({ errors: e.message });
    }
  }
);

// @route   DELETE api/auth
// @desc    Delete user
// @acess   Private
// @note    account can also be deleted using: DELETE api/profile, this route is only for testing
router.delete("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    await user.remove();
    res.json({ msg: "User removed", user });
  } catch {
    res.status(500).json({ msg: "Error: Cannot remove user." });
  }
});

module.exports = router;
