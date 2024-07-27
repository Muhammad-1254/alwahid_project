import { Controller, Get, Post, Body,  Param, Delete, Query } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
@Controller('hashtag')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Post("new")

  create(@Body() createHashtagDto: CreateHashtagDto) {
    return this.hashtagService.create(createHashtagDto);
  }

  

  @Get("search")
  findSimilarByName(@Query('name') name: string, ) {
    return this.hashtagService.findSimilarByName(name);
  }
  

 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hashtagService.remove(id);
  }
}
