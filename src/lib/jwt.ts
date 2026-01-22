import jwt from 'jsonwebtoken'
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string

interface JwtPayload {
  id: string;
}

export const generateAccess_token = (payload: JwtPayload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefresh_token = (payload:JwtPayload)=>{
    return jwt.sign({payload},REFRESH_SECRET,{
        expiresIn:"7d"
    })
}

export const verifyAccess_token = (token:string)=>{
    return jwt.verify(token,ACCESS_SECRET)
}

export const verifyRefresh_token = (token:string)=>{
    return jwt.verify(token,REFRESH_SECRET)
}

