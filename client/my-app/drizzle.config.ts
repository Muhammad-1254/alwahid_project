import type {Config} from 'drizzle-kit'

export default{
    schema:'./src/db/schema/chatSchema.ts',
    out:'./src/db/migrations',
    dialect:'sqlite',
    driver:'expo',

} satisfies Config