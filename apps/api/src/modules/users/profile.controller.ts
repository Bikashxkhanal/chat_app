import { ApiError, ApiResponse } from "@repo/utils";
import { asyncHandler , uploadOnCloudinary} from "../../utils";
import { userModel , MediaModel} from "@repo/db-nosql";
import type { files, UpdateProfileBody, uploadProfilePicture } from "@repo/types";


export const getMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const profile = await userModel
    .findById(user._id)
    .select("full_name email avatar phone_number type createdAt updatedAt");

  if (!profile) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, profile, "Profile fetched"));
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const body = req.body as UpdateProfileBody;

  if (body.email && !body.email.includes("@")) {
    throw new ApiError(400, "Invalid email address");
  }

  const updates: Record<string, unknown> = {};
  if (body.full_name !== undefined) {
    updates.full_name = body.full_name.trim().toLowerCase();
  }
  if (body.email !== undefined) {
    updates.email = body.email.trim() || null;
  }
  if (body.avatar !== undefined) {
    updates.avatar = body.avatar || null;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No profile fields to update");
  }

  const updated = await userModel
    .findByIdAndUpdate(user._id, updates, { new: true })
    .select("full_name email avatar phone_number type createdAt updatedAt");

  if (!updated) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, updated, "Profile updated successfully"));
});


// upload profile picture for each user, 
export const uploadProfileAvatar = asyncHandler(async (req, res) => {
      try {
        // console.log( process.env.CLOUDINARY_API_KEY);
        if(!req.files) throw new ApiError(401, "profile picture is missing")
        const files = req.files as uploadProfilePicture
 
        const upload = await uploadOnCloudinary(files.profilePicture[0].path)
        console.log(upload);

        if(upload?.resource_type != 'image') throw new ApiError(402, "Profile picture can only be image");

        const updated = await userModel.findOneAndUpdate( req.user?._id, {
          avatar : upload.secure_url
        },{ new : true})

        if(!updated) throw new ApiError(402, "Unauthorized Access, User not found")

        // console.log(uploadMediaDetails);
        
         return res.status(200).json(
            new ApiResponse(200 , {} ,"Profile uploaded successfully!")
          )


      } catch (error : any) {
        throw new ApiError(500, error.message)
      }
})
