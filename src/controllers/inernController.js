const InternModel = require("../models/inernModel")
const collegeModel = require("../models/collegeModel")

const InternController = async function (req, res) {

    try {
        let body = req.body

        // regex Condition
        let NumberCheck = /^[6-9]{1}[0-9]{9}$/

        let Emailcheck = /^[A-Za-z_.0-9]{2,1000}@[A-Za-z0-9]{3,1000}[.]{1}[A-Za-z.]{2,6}$/

        //checking data is coming from body or not

        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, msg: "Request Body can't be empty" })
        }
        if (!body.name) {
            return res.status(400).send({ Status: false, msg: "name is required" })
        }
        if (!body.mobile) {
            return res.status(400).send({ Status: false, msg: "mobile is required" })
        }
        if (!body.email) {
            return res.status(400).send({ Status: false, msg: "email is required" })
        }
        if (!body.collegeName) {
            return res.status(400).send({ Status: false, msg: "collegeName is required" })
        }
        if(body.isDeleted===true){
            return res.status(400).send({Status: false, msg:"Sory it can not be create due to it is deleted: true"})
        }
        if(typeof body.isDeleted === "string"){
            return res.status(400).send({Status: false, msg:" isDeleted is a string form, Sory it can not be create"})
        }


        // regex validation using 

        let StringCheck1 = /^[a-z]{1,}[a-z-]{1,}$/

        let StringCheck = /^[A-Za-z]{1}[A-Za-z ,]{1,10000}$/

        if (!StringCheck.test(body.name)) {
            return res.status(403).send({ Status: false, msg: "name must be alphabetic, no special characet or number allowed" })
        }

        if (!NumberCheck.test(body.mobile)) {
            return res.status(403).send({ Status: false, msg: "Mobile number must be 10 digit , must be start from 6 to 9 digit" })
        }
        if (!Emailcheck.test(body.email)) {
            return res.status(403).send({ Status: false, msg: "Please enter a valid email address" })
        }
        if(!StringCheck1.test(body.collegeName)){
            return res.status(403).send({status: false, msg:"College name is not valid"})
        }
       
        if(typeof body.mobile === "string"){
        return res.status(400).send({status: false, msg:"Sorry number can not be string"})
        }
        // checking college anabbreviated name and finding the college Object id

        let CheckCollegeID = await collegeModel.findOne({ name: body.collegeName })
        if (!CheckCollegeID) {
            return res.status(400).send({ Status: false, msg: "This is not a valid college name" })
        }

        // checking duplcate data of mobile and email: it must be unique

        let checkUniqueData = await InternModel.findOne({ $or: [{ email: body.email },{ mobile: body.mobile }] })
        
        if (checkUniqueData) {
            if (checkUniqueData.email === body.email || checkUniqueData.mobile === body.mobile ) {
                return res.status(403).send({ Status: false, msg: "This email/mobile has been used already or isDeleted true" })
            }
        }

        let InternData = await InternModel.create(body)
        let FinalData= await InternModel.findOneAndUpdate({email:body.email,mobile:body.mobile},{$set:{collegeId:CheckCollegeID._id}},{new:true})

        return res.status(201).send({ Status: true, msg: FinalData })
    }
    catch (err) {
        return res.status(500).send({ Status: false, msg: err.message })
    }
}

// Get Api controller

const InternDetails = async function (req, res) {

    try {
        let query = req.query

        if (Object.keys(query).length === 0) {
            return res.status(400).send({ Status: false, msg: "Req query is empty" })
        }
        if (!query.collegeName) {
            return res.status(400).send({ Status: false, msg: "Please enter the name ,This is anabbreviated college name. For example: iith" })
        }

        let StringCheck1 = /^[a-z]{1,}[a-z-]{1,}$/

        if (!StringCheck1.test(query.collegeName)) {
            return res.status(400).send({ Status: false, msg: "name must be alphabetic and lowercase and length > 1 , special character or space or number are not allowed" })
        }

        let CollegeName = await collegeModel.findOne({ name: query.collegeName })


        if (!CollegeName) {
            return res.status(400).send({ Status: false, msg: " No college Found" })
        }

        let getData = await InternModel.find({ collegeId: CollegeName._id }).select({ _id: 1, name: 1, email: 1, mobile: 1 })


        if (getData.length === 0) {
            return res.status(400).send({ Status: true, msg: " Sorry No student received into this college" })
        }


        let name=CollegeName.name
        let fullName=CollegeName.fullName
        let logoLink=CollegeName.logoLink

        let Interests = []
        Interests = Interests.concat(getData)
        
        let FinalData={}
        FinalData = {name,fullName,logoLink,Interests}
        

        return res.status(200).send({ Status: true, data: FinalData })
    }
    catch (err) {
        return res.status(500).send({ Status: false, msg: err.message })
    }
}




module.exports.InternController = InternController
module.exports.InternDetails = InternDetails
