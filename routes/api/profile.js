const express=require("express");
const request = require("request")
const config = require("config")
const router=express.Router();
const { check,validationResult } = require("express-validator");

const auth= require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User= require('../../models/User');
//@route Get api/profile/me
//@desc Get user 
//@access Private
router.get("/me", auth, async (req,res)=> {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',['name','avatar'])
        if(!profile){
            return res.status(400).json( { msg: "there is no profile for this user" })
        }
        res.json(profile)

    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Errror");
    }
});
router.post('/',
    [auth,
      [
        check ('status','status is required').not().isEmpty(),
      check('skills','skills is required').not().isEmpty()
        ]
    ],
    async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubUserName,
        skills,
        youtube,
        twitter,
        facebook,
        instagram,
        linkedin
    } = req.body;
 // Build Profile object
    const profileFields = {}
   profileFields.user = req.user.id;
   if(company) profileFields.company = company
   if(website) profileFields.website = website;
  if(location) profileFields.location = location
    if(bio) profileFields.bio = bio;
   if(status) profileFields.status = status;
   if(githubUserName) profileFields.githubUserName = githubUserName;
   if (skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    // Build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook= facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    try{
        let profile =  await Profile.findOne({  user: req.user.id });
        if(profile){
            profile = await Profile.findOneAndUpdate( { user: req.user.id }, { $set : profileFields }, { new: true });
            await profile.save();
            return res.json(profile)
        }

        // Create
        profile = new Profile(profileFields)
        await profile.save();
        res.json(profile)
    }catch(err){
       console.error(err.message);
       res.status(500).send('Server Error')
    }
}
);
router.get('/',async (req,res) => {
    try{
        const profiles = await Profile.find().populate('user',['name','avatar'])
        res.json(profiles)
    }catch(err){
        console.error(err.message);
        res.status(500).send('server Error')
    }
});

router.get('/user/:user_id',async (req,res) => {
    try{
        const profile = await Profile.findOne( { user: req.params.user_id }).populate('user',['name','avatar'])
        if(!profile) return res.status(400).json({ msg:"there is no profile for user"})
        res.json(profile)
    }catch(err){
        console.error(err.message);
        if (err.kind == 'ObjectId'){
            return res.status(400).json({ msg: " profile not found" })
        }
        res.status(500).send('server Error')
    }
});
// delete
router.delete('/',auth,async (req,res) => {
    try{
        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id })
        // remove user
        await User.findByIdAndRemove({ _id: req.user.id })
        res.json({ msg: "User deleted"})
    }catch(err){
        console.error(err.message);
        res.status(500).send('server Error')
    }
});
// @ route put api/profile/experience
// @desc add profile experience 
//@access private
router.put('/experience',[auth,[
    check('title','Title is required').not().isEmpty(),
    check('company','company is required').not().isEmpty(),
    check('from','from is required').not().isEmpty()

]], async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})

    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description

    }
    try{
        const profile = await Profile.findOne({ user: req.user.id })
        profile.experience.unshift(newExp);

        await profile.save()
        res.json(profile)


    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')

    }

    }


)
router.delete('/experience/:exp_id', auth,async(req,res) =>{
    try{
        const profile = await Profile.findOne({ user: req.user.id })
        const removeIndex = profile.experience.map(item =>item.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex,1)
        await profile.save()
        res.json(profile)


    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error")

    }

});
router.put('/education',[auth,[
    check('school','schhool is required').not().isEmpty(),
    check('degree',' Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of study is required').not().isEmpty(),
    check('from','from is required').not().isEmpty()


]], async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})

    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description

    }
    try{
        const profile = await Profile.findOne({ user: req.user.id })
        profile.education.unshift(newEdu);

        await profile.save()
        res.json(profile)


    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')

    }

    }


)
router.delete('/education/:edu_id', auth,async(req,res) =>{
    try{
        const profile = await Profile.findOne({ user: req.user.id })
        const removeIndex = profile.education.map(item =>item.id).indexOf(req.params.edu_id)
        profile.education.splice(removeIndex,1)
        await profile.save()
        res.json(profile)


    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error")

    }

})
// @route GET api/profile/ithub/:username
// Get user repos from Github
// @access Public
router.get('/github/:username',(req,res) =>{
    try{
        const options ={
            uri:`https://api.github.com/users/${req.params.username}/repos?per_pages=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_ secret =${config.get('githubSecret')}`,
            method:"GET",
            headers:{ 'user-agent':'node.js' }
        }
        request(options,(error,response,body) =>{
            if (error) console.error(error);

            if(response.statusCode!==200){
                return res.status(404).json({ msg:'no github profilr found' })

            }
            res.json(JSON.parse(body))
        })
        


    }catch(err){
        console.error(err.message);
        res.status (500).send('Server Error')

    }
})

module.exports = router;

