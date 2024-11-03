import { Injectable } from "@nestjs/common";
import { CreateHashtagDto } from "./dto/create-hashtag.dto";
import { EntityManager, Like, Repository } from "typeorm";
import { Hashtag } from "../../libs/shared/src/entities/micro-hashtag.entities/hashtag.entity";
import { v4 as uuid } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";
import { HashtagPostAssociation } from "../../libs/shared/src/entities/micro-hashtag.entities/hashtag-post-association.entity";

@Injectable()
export class HashtagService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(Hashtag)
    private readonly repository: Repository<Hashtag>,
  ) {}
  async create(createHashtagDto: CreateHashtagDto) {
    const hashtag = new Hashtag({ id: uuid(), ...createHashtagDto });
    await this.entityManager.save(hashtag);
  }
  async createHashtagPostAssociation(postId: string, hashtagId: string) {
    const association = new HashtagPostAssociation({
      hashtagId: hashtagId,
      postId: postId,
    })
    await this.entityManager.save(association);
  }

  async findSimilarByName(name: string) {
    const data = []
    const hashtags = await this.entityManager.find(Hashtag, {
      where: {
        name: Like(`%${name}%`),
      },
      take: 10,
    });
    for(let i = 0; i < hashtags.length; i++) {
      const count = await this.entityManager.count(HashtagPostAssociation,{
        where:{
          hashtagId:hashtags[i].id,
        }
        })
      data.push({hashtag:hashtags[i],count})
    }
   return data
  }
  findById(id: number) {
    return `This action returns a #${id} hashtag`;
  }

  async remove(id: string) {
    await this.repository.delete(id);
  }
}
