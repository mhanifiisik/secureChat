import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../prisma/prisma'

const jwtSecret = process.env.SECRET_KEY as string

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    })

    const token = jwt.sign({ userId: newUser.userId }, jwtSecret, {
      expiresIn: '1h'
    })

    return res.status(201).json({ token })
  } catch (error) {
    console.error('Error during user registration:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.userId }, jwtSecret, {
      expiresIn: '1h'
    })

    return res.status(200).json({ token })
  } catch (error) {
    console.error('Error during user login:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
