'use client'

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import React from 'react'

type MotionProviderProps = {
	children: React.ReactNode
}

export default function MotionProvider({ children }: MotionProviderProps) {
	return (
		<LazyMotion features={domAnimation}>
			<MotionConfig reducedMotion="user">{children}</MotionConfig>
		</LazyMotion>
	)
}

