import Card from './DiscussionCard' 

import { Navigation, FreeMode, A11y, Mousewheel, Keyboard} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ArticleSwiper(props){
  console.log(props);
  const abrev = (body) => {
    if(body.length > 60){
        return body.slice(0, 60) + "...";
    }
    else{
        return body;
    }
  }
  return (
    <Swiper
      modules={[Navigation, FreeMode, A11y, Mousewheel, Keyboard]}
      keyboard={{ enabled: true }}
      mousewheel={{ forceToAxis: true }}
      spaceBetween={10}
      freeMode={true}
      slidesPerView={4}
      navigation={true}
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log('slide change')}>
      {
        !props.discussions || props.discussions.length === 0 ?(
          <div>Cannot find any results</div>
        ):
        props.discussions.map((discussion) => {
            return(
              <SwiperSlide>
                <Card
                  id={discussion.discussion_id}
                  src={discussion.pfp}
                  title={discussion.title}
                  username={discussion.username}
                  body={discussion.body}
                  short={abrev(discussion.body)}
                />
              </SwiperSlide>
            );
        })
      }
    </Swiper>
  );
};
