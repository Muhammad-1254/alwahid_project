import { Controller,  Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService:AuthService
    ){}


    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login (@Request() req){ 
        return this.authService.login(req.user) 
    }

  

    @UseGuards(JwtRefreshTokenGuard) 
    @Post("refresh-token")
    async refreshToken(@Request()  req){
        return this.authService.refreshToken(req.user)
    
    }
    
}






//  curl http://localhost:3000/api/auth/temp -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzbWFuQGdtYWlsLmNvbSIsInN1YiI6eyJ1c2VySWQiOiI2MTE3Zjg0ZC02OTQwLTQ4ODMtOWQ1MS04MzY2Yjk5ZGU1NDQiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIn0sImlhdCI6MTcyMTEzOTk3MywiZXhwIjoxNzIxMjI2MzczfQ.cUP7b7c_wLBlcLVkqULUdqK3JNhBxuvRj1lbjmAICAw"
