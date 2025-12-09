const db = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

//GET all students

const getAllStudents = async (req, res) =>{
    try {
        const data = await db.query('SELECT * FROM students');
        if(!data){
            return res.status(404).send({
                success:false,
                message:'No Students Found'
            })
        }
        res.status(200).send({
            success:true,
            message:'Students Fetched Successfully',
            data:data[0]
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Server Error',
            error
        })
    }
}

//GET students by ID || GET

const getStudentByID = async (req,res) =>{
    try {
        const studentId = req.params.id
        if(!studentId){
            return res.status(400).send({
                success: false,
                message: "No Student ID Provided"
            })
        }

        const data = await db.query('SELECT * FROM students WHERE id = ?',[studentId]);
        if(!data){
            return res.status(404).send({
                success:false,
                message:'No Student Found'
            })
        }
        res.status(200).send({
            success:true,
            message:'Student Fetched Successfully',
            data:data[0]
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Server Error',
            error
        })
    }
}

//CREATE student || POST
const createStudent = async (req, res) => {
    try {
        const {name,email,semester,password} = req.body;

        if(!name || !email || !semester || !password){
            return res.status(400).send({
                success: false,
                message: "Please provide all required fields"
            })
        }

        const [existingStudent] = await db.query("SELECT * FROM students WHERE email = ?", [email]);
        if (existingStudent.length > 0){
            return res.status(409).send({
                success: false,
                message: "Email already exists"
            })
        }else{

            const data = await db.query(`INSERT INTO students (name, email, semester, password) VALUES (?,?,?,?)`,[name, email, semester, password]);
          if(!data){
            return res.status(400).send({
                success: false,
                message: "Unable to create student"
            })
        }
        res.status(201).send({
            success: true,
            message: "Student created successfully"
        })

        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error
        })
    }
}

//Login with email and password
const studentLogin = async (req,res) =>{
    try {
        const {email,password} = req.body;

         if(!email || !password){
            return res.status(400).send({
                success: false,
                message: "Please provide all required fields"
            })
        }

        const [rows] = await db.query('SELECT * FROM students WHERE email = ?',[email]);
        if (rows.length === 0){
            return res.status(404).send({
                success: false,
                message: "Email not found"
            })
        }
        const student = rows[0];
        if(student.password !== password){
            return res.send({
                success: false,
                message: "Incorrect Password"
            })
        }

        if(student.password === password){
            // Create JWT payload
            const payload = {
                id: student.id,
                email: student.email,
                name: student.name
            };
            
            // Generate JWT token
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
            
            res.status(200).send({
                success: true,
                message: "Login Successful",
                data: {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    semester: student.semester,
                },
                token: token
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error
        })
    }
}

//Get current user profile using JWT token
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from JWT payload
        
        const [rows] = await db.query('SELECT id, name, email, semester FROM students WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        
        const user = rows[0];
        res.status(200).send({
            success: true,
            message: "User profile fetched successfully",
            data: user
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error
        });
    }
}

//---------Store Messages-----------

const storeMessage = async (req, res) => {
    try {
        const {message,time,senderId,receiverId} = req.body;

        if(!message || !time || !senderId || !receiverId){
            return res.status(400).send({
                success: false,
                message: "Please provide all required fields"
            })
        }

        const data = await db.query(`INSERT INTO messages (message, time, senderId, receiverId) VALUES (?,?,?,?)`,[message, time, senderId, receiverId]);
          if(!data){
            return res.status(400).send({
                success: false,
                message: "Unable to store message"
            })
        }
        res.status(201).send({
            success: true,
            message: "Message stored successfully"
        })
        } catch (error) {

        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error
        })
    }
}

//---------Get Messages-----------

 const getMessages = async (req, res) => {
  try {
    const {myId, targetId} = req.query
    console.log("myId:", myId, "targetId:", targetId);

        if(!myId || !targetId){
            return res.status(400).send({
                success: false,
                message: "Sender ID or Receiver ID Missing"
            })
        }


    const [rows] = await db.query(
      `SELECT * FROM messages 
       WHERE (senderId = ? AND receiverId = ?) 
          OR (senderId = ? AND receiverId = ?)`,
      [myId, targetId, targetId, myId]
    );

    if (rows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No messages found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Messages fetched successfully",
      data: rows
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Server Error",
      error
    });
  }
};

//----------Get ID if User logged in with Google-----------

const getId = async (req, res) =>{
    try {

        const {email} = req.query
        const data = await db.query('SELECT id FROM students WHERE email = ?', [email]);
        if(!data){
            return res.status(404).send({
                success:false,
                message:'No ID Found'
            })
        }
        res.status(200).send({
            success:true,
            message:'ID Fetched Successfully',
            data:data[0]
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Server Error',
            error
        })
    }
}


module.exports = {getAllStudents, getStudentByID, createStudent, studentLogin, getCurrentUser, storeMessage, getMessages, getId};