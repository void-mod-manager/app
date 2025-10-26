use crate::traits::{GameIcon, GameMetadata, GameProvider};

pub struct Payday2Provider {

}

impl Payday2Provider {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait::async_trait]
impl GameProvider for Payday2Provider {
    fn game_id(&self) ->  &str {
        "core:payday_2"
    }

    fn mod_provider_id(&self) ->  &str {
        "core:modworkshop"
    }

    fn metadata(&self) -> GameMetadata {
        GameMetadata {
            id: self.game_id().into(),
            display_name: "PAYDAY 2".into(),
            short_name: "PD2".into(),
            icon: GameIcon::Path("https://cdn2.steamgriddb.com/icon/fa6d3cc166fbfbf005c9e77d96cba283/32/256x256.png".into()),
            provider_source: "core".into()
        }
    }

}
