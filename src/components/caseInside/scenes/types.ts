import type { MotionValue } from 'framer-motion'

/** Сцена получает прогресс активной главы 0…1 (MotionValue, без React-перерисовок) */
export type SceneProps = { p: MotionValue<number> }
