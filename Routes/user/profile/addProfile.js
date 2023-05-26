import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";

Router.post("/addstudentprofile", async (req, res) => {
    const token = req.headers["x-access-token"];
    const { name_of_institution,
    student_email,
    degree,
    course_name,
    course_duration,
    field_of_study,
    join_date,
    grade, } = req.body;
    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);
        const { id } = decoded;
        if (id) {
            const user = await UserSchema.findOneAndUpdate({ _id: id }, {
                student_profile: {
                    name_of_institution: name_of_institution,
                    student_email: student_email,
                    degree: degree,
                    course_name: course_name,
                    course_duration: course_duration,
                    field_of_study: field_of_study,
                    join_date: join_date,
                    grade: grade,
                }
            });
            
            if (!user.errors) {
                return res.status(200).json({
                    Success: true,
                    
                });
            } else {
                res.status(400).json({ Success: false ,user:user.errors});
            }
        } else {
            res.status(400).json({ msg: "Invalid Token" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("error");
    }
});

Router.post("/addjobprofile", async (req, res) => {
    const token = req.headers["x-access-token"];
    const { company_name,
    job_designation,
    location,
    job_description,
    qualifications, } = req.body;
    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);
        const { id } = decoded;
        if (id) {
            const user = await UserSchema.findOneAndUpdate({ _id: id }, {
                job_profile: {
                    company_name: company_name,
                    job_designation: job_designation,
                    location: location,
                    job_description: job_description,
                    qualifications: qualifications,
                }
            });
            if (!user.errors) {
                return res.status(200).json({
                    Success: true,
                    
                });
            } else {
                res.status(400).json({ Success: false ,user:user.errors});
            }
        } else {
            res.status(400).json({ msg: "Invalid Token" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("error");
    }
});


export default Router;